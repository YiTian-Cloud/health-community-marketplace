export default function OrderSuccessPage({
    searchParams,
  }: {
    searchParams: { orderId?: string };
  }) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Payment successful 🎉</h1>
        <p>Order ID: {searchParams.orderId ?? "(missing)"}</p>
      </main>
    );
  }
  