import {
  PortableText as BasePortableText,
  PortableTextComponents 
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import ResolvedLink from "@/app/components/ResolvedLink";

interface Props {
  value: PortableTextBlock[];
  className?: string;
}

const components: PortableTextComponents = {
  marks: {
    link: ({children, value}) => (
      <ResolvedLink link={value}>{children}</ResolvedLink>
    ),
  },
};

export default function PortableText({ className, value }: Props) {
  return (
    <div className={className}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}