// Configuration for the Edge Function
export const config = {
  path: "/process-inbound-email",
  method: "POST",
  authRequired: false
};

// Import required modules
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Main handler function
serve(async (req) => {
  console.log('📧 Received email processing request');
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    
    // Create a unique ID for this email
    const emailId = crypto.randomUUID();
    
    // Set up Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Array to track all stored files
    const storedFiles = [];
    
    // Clone the request to get the raw body as text
    const reqClone1 = req.clone();
    try {
      const rawText = await reqClone1.text();
      console.log('Raw request text length:', rawText.length);
      
      // Save the raw text for debugging
      await supabase.storage
        .from('docs')
        .upload(`emails/${emailId}/raw_request.txt`, 
          new TextEncoder().encode(rawText), {
          contentType: 'text/plain',
          upsert: true
        });
      storedFiles.push(`emails/${emailId}/raw_request.txt`);
    } catch (e) {
      console.error('Error saving raw request text:', e);
    }
    
    // Get the form data from the request
    const formData = await req.formData();
    
    // Save all form data keys for debugging
    await supabase.storage
      .from('docs')
      .upload(`emails/${emailId}/form_data_keys.json`, 
        new TextEncoder().encode(JSON.stringify([...formData.keys()], null, 2)), {
        contentType: 'application/json',
        upsert: true
      });
    storedFiles.push(`emails/${emailId}/form_data_keys.json`);
    
    // Check for email field which might contain the entire MIME message
    const emailField = formData.get('email');
    if (emailField && typeof emailField === 'string') {
      console.log('Found email field with length:', emailField.length);
      
      // Save the email field for debugging
      await supabase.storage
        .from('docs')
        .upload(`emails/${emailId}/email_field.txt`, 
          new TextEncoder().encode(emailField), {
          contentType: 'text/plain',
          upsert: true
        });
      storedFiles.push(`emails/${emailId}/email_field.txt`);
      
      // Special case for PDF detection
      if (emailField.includes('%PDF-')) {
        console.log('Detected PDF content in email field');
        
        // Find PDF markers
        const pdfStartIndex = emailField.indexOf('%PDF-');
        if (pdfStartIndex >= 0) {
          // Look for PDF filename
          let pdfFilename = 'extracted_document.pdf';
          
          // Try to find filename in nearby content
          const filenameSearchText = emailField.substring(Math.max(0, pdfStartIndex - 500), pdfStartIndex);
          const filenameMatch = filenameSearchText.match(/filename="([^"]+\.pdf)"|filename=([^;\r\n]+\.pdf)/i);
          if (filenameMatch) {
            pdfFilename = filenameMatch[1] || filenameMatch[2];
          }
          
          console.log(`Attempting to extract PDF with filename: ${pdfFilename}`);
          
          // Extract PDF content - this is tricky as PDFs can be binary
          // We'll try to find the PDF end marker %%EOF and extract everything in between
          let pdfEndIndex = emailField.indexOf('%%EOF', pdfStartIndex);
          if (pdfEndIndex > pdfStartIndex) {
            // Add a bit more to include the EOF marker and any trailing data
            pdfEndIndex += 10;
            
            // Get the PDF content
            const pdfContent = emailField.substring(pdfStartIndex, Math.min(pdfEndIndex, emailField.length));
            
            // Generate safe filename
            const safeName = pdfFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `emails/${emailId}/attachments/${safeName}`;
            
            try {
              // Upload the PDF content
              await supabase.storage
                .from('docs')
                .upload(storagePath, 
                  new TextEncoder().encode(pdfContent), {
                  contentType: 'application/pdf',
                  upsert: true
                });
              
              console.log(`Successfully uploaded extracted PDF: ${safeName}`);
              storedFiles.push(storagePath);
              
              // Store attachment metadata
              const attachmentMetadata = {
                filename: pdfFilename,
                type: 'application/pdf',
                size: pdfContent.length,
                path: storagePath,
                source: 'pdf_extracted',
                timestamp: new Date().toISOString()
              };
              
              await supabase.storage
                .from('docs')
                .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
                  new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
                  contentType: 'application/json',
                  upsert: true
                });
              storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
            } catch (error) {
              console.error(`Error processing extracted PDF ${pdfFilename}:`, error);
            }
          }
        }
      }
      
      // Direct search for base64 PDF content
      const base64PdfMatch = emailField.match(/Content-Type: application\/pdf[^]*?base64,([A-Za-z0-9+/=\r\n]+)/);
      if (base64PdfMatch && base64PdfMatch[1]) {
        console.log('Found base64 encoded PDF content');
        
        try {
          // Clean up the base64 string
          const base64Content = base64PdfMatch[1].replace(/[\r\n\s]/g, '');
          
          // Decode base64 content
          const binaryContent = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
          console.log(`Decoded ${binaryContent.length} bytes of PDF from base64`);
          
          // Look for filename
          let pdfFilename = 'base64_document.pdf';
          const filenameSearchText = emailField.substring(
            Math.max(0, base64PdfMatch.index - 500), 
            base64PdfMatch.index
          );
          const filenameMatch = filenameSearchText.match(/filename="([^"]+\.pdf)"|filename=([^;\r\n]+\.pdf)/i);
          if (filenameMatch) {
            pdfFilename = filenameMatch[1] || filenameMatch[2];
          }
          
          // Generate safe filename
          const safeName = pdfFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storagePath = `emails/${emailId}/attachments/${safeName}`;
          
          // Upload the PDF content
          await supabase.storage
            .from('docs')
            .upload(storagePath, binaryContent, {
              contentType: 'application/pdf',
              upsert: true
            });
          
          console.log(`Successfully uploaded base64 PDF: ${safeName}`);
          storedFiles.push(storagePath);
          
          // Store attachment metadata
          const attachmentMetadata = {
            filename: pdfFilename,
            type: 'application/pdf',
            size: binaryContent.length,
            path: storagePath,
            source: 'base64_pdf_extracted',
            timestamp: new Date().toISOString()
          };
          
          await supabase.storage
            .from('docs')
            .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
              new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
              contentType: 'application/json',
              upsert: true
            });
          storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
        } catch (error) {
          console.error('Error processing base64 PDF:', error);
        }
      }
      
      // Check if this is a MIME message that might contain attachments
      if (emailField.includes('Content-Type: multipart/')) {
        console.log('MIME message detected, searching for attachments');
        
        // Find all boundaries in the email (there might be nested ones)
        const boundaryMatches = [...emailField.matchAll(/boundary="([^"]+)"|boundary=([^;\r\n]+)/g)];
        console.log(`Found ${boundaryMatches.length} MIME boundaries`);
        
        if (boundaryMatches.length > 0) {
          // Process each boundary
          for (const boundaryMatch of boundaryMatches) {
            const boundary = boundaryMatch[1] || boundaryMatch[2];
            console.log('Processing MIME boundary:', boundary);
            
            // Split the email into parts using the boundary
            const parts = emailField.split(`--${boundary}`);
            console.log(`Split email into ${parts.length} parts using boundary ${boundary}`);
            
            // Process each part
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              
              // Skip the preamble and epilogue
              if (i === 0 || (i === parts.length - 1 && part.trim() === '--')) {
                continue;
              }
              
              // Check if this part is an attachment
              if (part.includes('Content-Disposition: attachment') || 
                 (part.includes('Content-Disposition: inline') && part.includes('filename='))) {
                
                // Extract filename
                let filename = 'unknown-attachment';
                const filenameMatch = part.match(/filename="([^"]+)"|filename=([^;\r\n]+)/);
                if (filenameMatch) {
                  filename = filenameMatch[1] || filenameMatch[2];
                }
                console.log(`Found attachment in MIME part ${i}: ${filename}`);
                
                // Extract content type
                let contentType = 'application/octet-stream';
                const contentTypeMatch = part.match(/Content-Type:\s*([^;\r\n]+)/i);
                if (contentTypeMatch) {
                  contentType = contentTypeMatch[1].trim();
                }
                console.log(`Content type: ${contentType}`);
                
                // Find the boundary between headers and content
                const headerEndIndex = part.indexOf('\r\n\r\n');
                if (headerEndIndex > 0) {
                  // Extract content (everything after the headers)
                  let content = part.substring(headerEndIndex + 4);
                  
                  // Check if content is base64 encoded
                  const isBase64 = part.toLowerCase().includes('content-transfer-encoding: base64');
                  console.log(`Is base64 encoded: ${isBase64}`);
                  
                  // Process content based on encoding
                  if (isBase64) {
                    // Clean up the base64 string (remove whitespace, etc.)
                    content = content.replace(/[\r\n\s]/g, '');
                    
                    try {
                      // Decode base64 content
                      const binaryContent = Uint8Array.from(atob(content), c => c.charCodeAt(0));
                      console.log(`Decoded ${binaryContent.length} bytes from base64`);
                      
                      // Generate safe filename
                      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                      const storagePath = `emails/${emailId}/attachments/${safeName}`;
                      
                      // Upload the attachment
                      await supabase.storage
                        .from('docs')
                        .upload(storagePath, binaryContent, {
                          contentType: contentType,
                          upsert: true
                        });
                      
                      console.log(`Successfully uploaded MIME attachment: ${safeName}`);
                      storedFiles.push(storagePath);
                      
                      // Store attachment metadata
                      const attachmentMetadata = {
                        filename,
                        type: contentType,
                        size: binaryContent.length,
                        path: storagePath,
                        source: 'mime_parsed',
                        boundary,
                        timestamp: new Date().toISOString()
                      };
                      
                      await supabase.storage
                        .from('docs')
                        .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
                          new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
                          contentType: 'application/json',
                          upsert: true
                        });
                      storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
                    } catch (error) {
                      console.error(`Error processing MIME attachment ${filename}:`, error);
                    }
                  } else {
                    // For non-base64 encodings, try to handle as raw content
                    try {
                      console.log('Attachment is not base64 encoded, trying to process as raw content');
                      
                      // Generate safe filename
                      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                      const storagePath = `emails/${emailId}/attachments/${safeName}`;
                      
                      // Upload the attachment as raw text
                      await supabase.storage
                        .from('docs')
                        .upload(storagePath, 
                          new TextEncoder().encode(content), {
                          contentType: contentType,
                          upsert: true
                        });
                      
                      console.log(`Successfully uploaded raw MIME attachment: ${safeName}`);
                      storedFiles.push(storagePath);
                      
                      // Store attachment metadata
                      const attachmentMetadata = {
                        filename,
                        type: contentType,
                        size: content.length,
                        path: storagePath,
                        source: 'mime_parsed_raw',
                        boundary,
                        timestamp: new Date().toISOString()
                      };
                      
                      await supabase.storage
                        .from('docs')
                        .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
                          new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
                          contentType: 'application/json',
                          upsert: true
                        });
                      storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
                    } catch (error) {
                      console.error(`Error processing raw MIME attachment ${filename}:`, error);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Extract text and HTML content
    let text = '';
    let html = '';
    
    // Try different fields for text content
    const textFields = ['text', 'plain', 'body-plain', 'text_body'];
    for (const field of textFields) {
      const content = formData.get(field)?.toString();
      if (content && content.trim()) {
        text = content;
        console.log(`Found text content in field: ${field}`);
        break;
      }
    }
    
    // Try different fields for HTML content
    const htmlFields = ['html', 'body-html', 'html_body'];
    for (const field of htmlFields) {
      const content = formData.get(field)?.toString();
      if (content && content.trim()) {
        html = content;
        console.log(`Found HTML content in field: ${field}`);
        break;
      }
    }
    
    // If we still don't have text content, try to extract it from the email field
    if (!text && emailField && typeof emailField === 'string') {
      // Try to find plain text part in the MIME message
      const textMatch = emailField.match(/Content-Type: text\/plain[^]*?\r\n\r\n([^]*?)(?:\r\n--)/);
      if (textMatch && textMatch[1]) {
        text = textMatch[1].trim();
        console.log('Extracted text content from MIME message');
      }
    }
    
    // Store text content if available
    if (text) {
      await supabase.storage
        .from('docs')
        .upload(`emails/${emailId}/readable_body.txt`, 
          new TextEncoder().encode(text), {
          contentType: 'text/plain',
          upsert: true
        });
      storedFiles.push(`emails/${emailId}/readable_body.txt`);
    }
    
    // Store HTML content if available
    if (html) {
      await supabase.storage
        .from('docs')
        .upload(`emails/${emailId}/body.html`, 
          new TextEncoder().encode(html), {
          contentType: 'text/html',
          upsert: true
        });
      storedFiles.push(`emails/${emailId}/body.html`);
    }
    
    // Store raw email data as JSON
    const rawEmailData = {};
    for (const [key, value] of formData.entries()) {
      rawEmailData[key] = (value instanceof File) 
        ? `[File: ${value.name}, ${value.type}, ${value.size} bytes]`
        : value.toString();
    }
    
    await supabase.storage
      .from('docs')
      .upload(`emails/${emailId}/raw_data.json`, 
        new TextEncoder().encode(JSON.stringify(rawEmailData, null, 2)), {
        contentType: 'application/json',
        upsert: true
      });
    storedFiles.push(`emails/${emailId}/raw_data.json`);
    
    // Get basic email info
    const subject = formData.get('subject')?.toString() || '';
    const from = formData.get('from')?.toString() || '';
    const to = formData.get('to')?.toString() || '';
    
    // Store email metadata
    const metadata = {
      id: emailId,
      subject: subject,
      from: from,
      to: to,
      hasText: !!text,
      hasHtml: !!html,
      timestamp: new Date().toISOString()
    };
    await supabase.storage
      .from('docs')
      .upload(`emails/${emailId}/metadata.json`, 
        new TextEncoder().encode(JSON.stringify(metadata, null, 2)), {
        contentType: 'application/json',
        upsert: true
      });
    storedFiles.push(`emails/${emailId}/metadata.json`);
    
    // Create a human-readable summary file
    let readableSummary = `Email Summary
====================
ID: ${emailId}
Subject: ${metadata.subject}
From: ${metadata.from}
To: ${metadata.to}
Date: ${metadata.timestamp}
`;

    // Add body text if available
    if (text && text.trim()) {
      readableSummary += `\nBody Text:
------------------
${text}
`;
    } else {
      readableSummary += `\nBody Text:
------------------
[No text content available]
`;
    }

    // List attachments
    const attachmentList = storedFiles.filter(file => file.includes('/attachments/') && !file.includes('.metadata.json'));
    if (attachmentList.length > 0) {
      readableSummary += `\nAttachments (${attachmentList.length}):
------------------
${attachmentList.map(path => {
  const filename = path.split('/').pop();
  return `- ${filename}`;
}).join('\n')}
`;
    } else {
      readableSummary += `\nAttachments:
------------------
[No attachments]
`;
    }

    // Save the readable summary
    await supabase.storage
      .from('docs')
      .upload(`emails/${emailId}/email_summary.txt`, 
        new TextEncoder().encode(readableSummary), {
        contentType: 'text/plain',
        upsert: true
      });
    storedFiles.push(`emails/${emailId}/email_summary.txt`);
    
    // Process attachments
    console.log('All form data keys:', [...formData.keys()]);
    
    // Look for attachments in different ways:
    // 1. Check for explicit attachment count
    const attachmentCount = parseInt(formData.get('attachments')?.toString() || '0');
    console.log('Explicit attachment count:', attachmentCount);
    
    // 2. Look for attachment keys in various formats
    const attachmentKeys = [...formData.keys()].filter(key => 
      key.startsWith('attachment') || 
      key.match(/^attachment-\d+$/) || 
      key.match(/^attachment\d+$/)
    );
    console.log('Found attachment keys:', attachmentKeys);
    
    // Process all attachments found
    for (const key of attachmentKeys) {
      const fileObj = formData.get(key);
      
      if (fileObj instanceof File) {
        console.log(`Processing attachment: ${key}, name: ${fileObj.name}, type: ${fileObj.type}, size: ${fileObj.size} bytes`);
        
        // Get file details
        const filename = fileObj.name || `${key}.file`;
        const fileType = fileObj.type || 'application/octet-stream';
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `emails/${emailId}/attachments/${safeName}`;

        try {
          // Store the attachment based on its type
          if (fileType.startsWith('text/') || fileType === 'application/json') {
            const textContent = await fileObj.text();
            await supabase.storage
              .from('docs')
              .upload(storagePath, 
                new TextEncoder().encode(textContent), {
                contentType: fileType,
                upsert: true
              });
          } else {
            const fileBuffer = await fileObj.arrayBuffer();
            console.log(`File buffer size: ${fileBuffer.byteLength} bytes`);
            
            await supabase.storage
              .from('docs')
              .upload(storagePath, fileBuffer, {
                contentType: fileType,
                upsert: true
              });
          }
          
          console.log(`Successfully uploaded attachment: ${safeName}`);
          storedFiles.push(storagePath);
          
          // Store attachment metadata
          const attachmentMetadata = {
            filename,
            type: fileType,
            size: fileObj.size,
            path: storagePath,
            timestamp: new Date().toISOString()
          };
          
          await supabase.storage
            .from('docs')
            .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
              new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
              contentType: 'application/json',
              upsert: true
            });
          storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
        } catch (error) {
          console.error(`Error processing attachment ${filename}:`, error);
        }
      } else {
        console.log(`Key ${key} is not a file object:`, fileObj);
      }
    }
    
    // Also check for numbered attachments without the 'attachment' prefix
    // (some email providers might use different naming conventions)
    for (let i = 1; i <= 10; i++) {
      // Skip if we've already processed this as an attachment key
      if (attachmentKeys.includes(`attachment${i}`)) continue;
      
      const fileObj = formData.get(`${i}`);
      if (fileObj instanceof File) {
        console.log(`Processing numbered attachment: ${i}, name: ${fileObj.name}, type: ${fileObj.type}`);
        
        // Process the file (similar to above)
        const filename = fileObj.name || `attachment-${i}.file`;
        const fileType = fileObj.type || 'application/octet-stream';
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `emails/${emailId}/attachments/${safeName}`;

        try {
          const fileBuffer = await fileObj.arrayBuffer();
          await supabase.storage
            .from('docs')
            .upload(storagePath, fileBuffer, {
              contentType: fileType,
              upsert: true
            });
          
          console.log(`Successfully uploaded numbered attachment: ${safeName}`);
          storedFiles.push(storagePath);
          
          // Store metadata (similar to above)
          const attachmentMetadata = {
            filename,
            type: fileType,
            size: fileObj.size,
            path: storagePath,
            timestamp: new Date().toISOString()
          };
          
          await supabase.storage
            .from('docs')
            .upload(`emails/${emailId}/attachments/${safeName}.metadata.json`,
              new TextEncoder().encode(JSON.stringify(attachmentMetadata, null, 2)), {
              contentType: 'application/json',
              upsert: true
            });
          storedFiles.push(`emails/${emailId}/attachments/${safeName}.metadata.json`);
        } catch (error) {
          console.error(`Error processing numbered attachment ${filename}:`, error);
        }
      }
    }
    
    // Check for attachment info
    const attachmentInfo = formData.get('attachment-info');
    if (attachmentInfo) {
      console.log('Attachment info found:', attachmentInfo.toString().substring(0, 200));
      try {
        const attachmentInfoJson = JSON.parse(attachmentInfo.toString());
        console.log('Parsed attachment info:', JSON.stringify(attachmentInfoJson, null, 2));
        
        // Store attachment info for reference
        await supabase.storage
          .from('docs')
          .upload(`emails/${emailId}/attachment-info.json`,
            new TextEncoder().encode(JSON.stringify(attachmentInfoJson, null, 2)), {
            contentType: 'application/json',
            upsert: true
          });
        storedFiles.push(`emails/${emailId}/attachment-info.json`);
      } catch (e) {
        console.error('Error parsing attachment info:', e);
      }
    }
    
    // Send success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email processed successfully',
        emailId,
        storedFiles,
        metadata
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Send error response
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error processing email',
        error: error.message
      }),
      {
        status: 200, // Still 200 to acknowledge receipt
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});