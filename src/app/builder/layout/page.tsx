import BuilderClient from '../BuilderClient';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BuilderLayoutPage({ searchParams }: PageProps) {
  return <BuilderClient initialTab="layout" searchParams={searchParams} />;
}
