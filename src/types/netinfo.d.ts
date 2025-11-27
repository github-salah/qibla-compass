declare module '@react-native-community/netinfo' {
  const NetInfo: {
    addEventListener: (cb: (state: { isConnected?: boolean | null }) => void) => { (): void };
    fetch: () => Promise<{ isConnected?: boolean | null }>;
  };
  export default NetInfo;
}
