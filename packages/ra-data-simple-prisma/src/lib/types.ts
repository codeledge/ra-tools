export type SetImplicitShortcut = string;

export type SetImplicitConnection = {
  [connectModel: string]: string;
};

export type SetExplicitConnection = {
  [pivotModel: string]: {
    [connectModel: string]: string;
  };
};
