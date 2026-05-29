import { ProposalViewClient } from './ProposalViewClient';

type Params = { params: Promise<{ locale: string; id: string }> };

export default async function ProposalViewPage({ params }: Params) {
  const { id } = await params;
  return <ProposalViewClient id={id} />;
}
