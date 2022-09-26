// TODO ADD CANCEL

window.onload = async () => {
  user = await user_module.user();
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  console.log(params.token);
  const token = params.token;
  if (token) {
    await Order.capture_payment(user.token, token);
    window.history.replaceState({}, document.title, "/" + "index.html");
  }
};
