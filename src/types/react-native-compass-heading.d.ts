declare module 'react-native-compass-heading' {
  export interface CompassHeadingCallbackArg {
    heading: number;
    accuracy?: number;
  }
  function start(rate: number, cb: (arg: CompassHeadingCallbackArg) => void): void;
  function stop(): void;
  export default { start, stop };
}
declare module 'react-native-compass-heading' {
  export interface CompassHeadingCallbackArg {
    heading: number;
    accuracy?: number;
  }
  function start(rate: number, cb: (arg: CompassHeadingCallbackArg) => void): void;
  function stop(): void;
  export default { start, stop };
}
