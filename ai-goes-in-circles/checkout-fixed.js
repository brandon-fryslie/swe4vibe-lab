// [LAW:types-are-the-program] one status value; only the legal states are representable:
//   { tag: 'idle' }
//   { tag: 'submitting' }
//   { tag: 'error', message }
//   { tag: 'success', receipt }
// The payload lives inside the variant, so "error with no message",
// "success with no receipt", and "success and error at once" cannot be built.
let status = { tag: 'idle' }
let retryCount = 0

async function submitOrder(cart) {
  status = { tag: 'submitting' }
  render()
  const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify(cart) })
  if (!res.ok) {
    retryCount++
    status = { tag: 'error', message: 'Could not place order' }
  } else {
    status = { tag: 'success', receipt: await res.json() }
  }
  render()
}

function render() {
  // [LAW:dataflow-not-control-flow] exhaustive switch on the one value;
  // no guard can be forgotten because there is nothing left to guard.
  switch (status.tag) {
    case 'idle':       showForm(); break
    case 'submitting': showSpinner(); break
    case 'error':      showError(status.message); break
    case 'success':    showReceipt(status.receipt); break
  }
}
