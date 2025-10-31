import BuilderClient from '../BuilderClient';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BuilderValidationPage({ searchParams }: PageProps) {
  return <BuilderClient initialTab="validation" searchParams={searchParams} />;
}
