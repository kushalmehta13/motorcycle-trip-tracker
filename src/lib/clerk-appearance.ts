export const clerkAppearance = {
  variables: {
    colorPrimary: "#161616",
    colorBackground: "#ffffff",
    colorText: "#161616",
    colorMutedForeground: "#16161699",
    colorInputBackground: "#f6f1e7",
    colorInputText: "#161616",
    borderRadius: "0px",
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontFamilyButtons: "var(--font-archivo-black), sans-serif",
    generalLabelFontSize: "11px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "rounded-none border-0 bg-transparent shadow-none",
    headerTitle: "uppercase tracking-tight",
    headerSubtitle: "text-sm font-medium opacity-70",

    socialButtonsBlockButton:
      "rounded-none border-[3px] border-[#161616] bg-white font-bold uppercase tracking-widest text-xs shadow-[3px_3px_0_0_#161616] transition-transform duration-150 hover:-translate-y-0.5 data-[loading]:opacity-60",
    dividerLine: "h-[3px] bg-[#161616]",
    dividerText: "text-[10px] font-bold tracking-[0.18em] uppercase opacity-60",

    formFieldLabel: "text-[11px] font-bold tracking-[0.18em] uppercase",
    formFieldInput:
      "rounded-none border-[3px] border-[#161616] bg-paper font-medium placeholder:text-[#16161666] focus:border-[#161616] focus:ring-0",
    formFieldInputShowPasswordButton: "rounded-none",

    formButtonPrimary:
      "rounded-none border-[3px] border-[#161616] bg-accent-yellow font-display text-sm tracking-widest text-[#161616] shadow-[4px_4px_0_0_#161616] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-pink hover:text-paper hover:shadow-[6px_6px_0_0_#161616]",

    footerActionLink:
      "font-bold text-accent-pink underline decoration-2 underline-offset-2",
    alternativeMethodsBlockButton:
      "rounded-none border-2 border-[#161616] bg-white font-bold uppercase tracking-widest text-xs",
    identityPreviewEditButton:
      "rounded-none border-2 border-[#161616] bg-accent-yellow px-2 py-1 text-xs",
    identityPreviewText: "text-sm font-bold",

    otpCodeFieldInput:
      "rounded-none border-[3px] border-[#161616] bg-paper font-bold",
    formFieldErrorText: "font-bold text-accent-pink",
    alert: "rounded-none border-[3px] border-[#161616] bg-accent-orange",
  },
};
