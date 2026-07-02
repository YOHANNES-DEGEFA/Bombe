export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/watchTv/${params.id}/1/1`,
      permanent: true,
    },
  };
}

export default function TvRedirectPage() {
  return null;
}
