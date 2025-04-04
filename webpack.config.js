module.exports = {
  // ...existing code...
  module: {
    rules: [
      // ...existing rules...
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/intro.js\/intro.module.js/,
          /src\/core\/DOMEvent.ts/,
          /src\/core\/addOverlayLayer.ts/,
          /src\/core\/dontShowAgain.ts/,
          /src\/core\/exitIntro.ts/,
          /src\/core\/fetchIntroSteps.ts/,
          /src\/core\/hint.ts/,
          /src\/core\/introForElement.ts/,
          /src\/core\/onKeyDown.ts/,
          /src\/core\/onResize.ts/,
          /src\/core\/placeTooltip.ts/,
          /src\/core\/refresh.ts/,
          /src\/core\/removeShowElement.ts/,
          /src\/core\/setHelperLayerPosition.ts/,
          /src\/core\/showElement.ts/,
          /src\/core\/steps.ts/,
          /src\/index.ts/,
          /src\/intro.ts/,
          /src\/option.ts/,
          /src\/util\/addClass.ts/,
          /src\/util\/appendChild.ts/,
          /src\/util\/checkLeft.ts/,
          /src\/util\/checkRight.ts/,
          /src\/util\/cloneObject.ts/,
          /src\/util\/cookie.ts/,
          /src\/util\/createElement.ts/,
          /src\/util\/debounce.ts/,
          /src\/util\/elementInViewport.ts/,
          /src\/util\/getOffset.ts/,
          /src\/util\/getPropValue.ts/,
          /src\/util\/getScrollParent.ts/,
          /src\/util\/getWindowSize.ts/,
          /src\/util\/isFixed.ts/,
          /src\/util\/isFunction.ts/,
          /src\/util\/removeChild.ts/,
          /src\/util\/removeClass.ts/,
          /src\/util\/removeEntry.ts/,
          /src\/util\/scrollParentToElement.ts/,
          /src\/util\/scrollTo.ts/,
          /src\/util\/setAnchorAsButton.ts/,
          /src\/util\/setShowElement.ts/,
          /src\/util\/setStyle.ts/,
          /src\/util\/stamp.ts/,
        ],
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /source-map-loader/,
      message: /Failed to parse source map/,
    },
  ],
  // ...existing code...
};
