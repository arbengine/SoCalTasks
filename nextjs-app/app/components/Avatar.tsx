import Image from "next/image";
import { urlForImage } from "@/sanity/lib/utils";
import DateComponent from "@/app/components/Date";

type SanityImage = {
  asset?: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

type Props = {
  person: {
    firstName: string | null;
    lastName: string | null;
    picture?: SanityImage;
  };
  date: string;
};

export default function Avatar({ person, date }: Props) {
  const { firstName, lastName, picture } = person;

  // Create the image URL once, with proper null checks
  const imageBuilder = picture?.asset?._ref ? urlForImage(picture) : null;
  const imageUrl = imageBuilder
    ? imageBuilder.height(96).width(96).fit("crop").url()
    : null;

  return (
    <div className="flex items-center">
      {imageUrl ? (
        <div className="mr-4 h-9 w-9">
          <Image
            alt={picture?.alt || ""}
            className="h-full rounded-full object-cover"
            height={48}
            width={48}
            src={imageUrl}
          />
        </div>
      ) : (
        <div className="mr-1">By </div>
      )}
      <div className="flex flex-col">
        {firstName && lastName && (
          <div className="font-bold">
            {firstName} {lastName}
          </div>
        )}
        <div className="text-gray-500 text-sm">
          <DateComponent dateString={date} />
        </div>
      </div>
    </div>
  );
}