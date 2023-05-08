export interface Example {
  id: string;
  name: string;
}

export interface ExampleCreated {
  name: string;
}

export interface ExampleTextChanged {
  text: string;
}

export interface ExampleEvents {
  ExampleCreated: ExampleCreated;
  ExampleTextChanged: ExampleTextChanged;
}
