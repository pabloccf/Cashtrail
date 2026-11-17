// Shape and entry animation of the native <dialog>s (Modal and ConfirmDialog). Each adds its width
// on desktop (md:max-w-lg, md:max-w-sm...).
//
// Mobile: a "bottom sheet". It sits on the bottom edge (mt-auto mb-0), takes the whole width, has only
// its top corners rounded and slides up when it opens: the thumb reaches the buttons easily.
// Desktop (md): a centered pop-up that fades in and grows slightly, as before.
//
// `starting:` = the styles of the first frame (@starting-style). With `transition`, the dialog animates
// from them to its normal styles. There is no exit animation: React unmounts the dialog at once.
// motion-reduce: no slide or zoom for users who ask their system for less motion
export const dialogClass =
  'mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 shadow-elevated ' +
  'transition duration-300 ease-out starting:translate-y-full motion-reduce:transition-none ' +
  'backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px] ' +
  'md:m-auto md:max-h-[calc(100dvh-4rem)] md:w-[calc(100%-2rem)] md:rounded-2xl md:duration-200 ' +
  'md:starting:translate-y-0 md:starting:scale-95 md:starting:opacity-0'
