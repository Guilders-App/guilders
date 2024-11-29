declare namespace React {
  interface IframeHTMLAttributes<T> extends React.HTMLAttributes<T> {
    credentialless?: "true";
  }
}
