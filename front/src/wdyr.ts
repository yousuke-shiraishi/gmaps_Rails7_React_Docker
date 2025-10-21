/// <reference types="@welldone-software/why-did-you-render" />
import React from "react";
import whyDidYouRender from "@welldone-software/why-did-you-render";

(React as any).whyDidYouRender = true;
whyDidYouRender(React, { trackAllPureComponents: true });
