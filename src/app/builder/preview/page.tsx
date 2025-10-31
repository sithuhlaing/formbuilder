import BuilderClient from '../BuilderClient';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BuilderPreviewPage({ searchParams }: PageProps) {
  return <BuilderClient initialTab="preview" searchParams={searchParams} />;
}
