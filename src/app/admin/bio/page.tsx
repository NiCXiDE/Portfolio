import { getDataSource } from "@/db/data-source";
import { BioEntity } from "@/db/entities";
import { BioClient } from "@/components/admin/BioClient";
import { mediaUrl } from "@/lib/media";

export default async function AdminBioPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const bio = await ds.getRepository(BioEntity).findOneByOrFail({ id: "main" });

  return (
    <BioClient
      saved={saved}
      bio={{
        text: bio.text,
        photoPath: bio.photoPath,
        photoPreviewUrl: mediaUrl(bio.photoPath),
        photoAlt: bio.photoAlt,
        signaturePath: bio.signaturePath,
        signaturePreviewUrl: mediaUrl(bio.signaturePath),
        signatureAlt: bio.signatureAlt,
        cvPath: bio.cvPath,
        cvPreviewUrl: mediaUrl(bio.cvPath),
        cvPathEn: bio.cvPathEn,
        cvEnPreviewUrl: mediaUrl(bio.cvPathEn),
      }}
    />
  );
}
