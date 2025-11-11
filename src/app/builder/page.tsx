import BuilderClient from './BuilderClient';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BuilderPage({ searchParams }: PageProps) {
  return <BuilderClient initialTab="preview" searchParams={searchParams} />;
}
