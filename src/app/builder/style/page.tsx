import BuilderClient from '../BuilderClient';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BuilderStylePage({ searchParams }: PageProps) {
  return <BuilderClient initialTab="style" searchParams={searchParams} />;
}
