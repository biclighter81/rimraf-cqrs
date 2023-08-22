export interface Example {
  id: string;
  name: string;
}

export interface ExampleCreated {
  id: string;
  name: string;
}

export interface ExampleTextChanged {
  id: string;
  text: string;
}

export interface ExampleEvents {
  ExampleCreated: ExampleCreated;
  ExampleTextChanged: ExampleTextChanged;
}
