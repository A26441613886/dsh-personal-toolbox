window.__ModuleLoader__.load({
  id: "@local/dsh-personal-balance",
  factory: () => ({
    apply(ctx) {
      ctx.effect(() => {
        const notify = enabled => {
          window.__dshPersonalBalanceEnabled = enabled;
          window.dispatchEvent(new Event("dsh-personal-balance-changed"));
        };
        notify(true);
        return () => notify(false);
      }, "personal-customizations: balance UI");
    }
  })
});
