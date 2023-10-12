interface CommandResponse{
	errorMessage?: string;
	id?: string;
	name: string
}
interface ExampleCreatedInput{
	name: string
}
interface ExampleDeleted{
	id: string
}
interface ExampleTextChangedInput{
	id: string;
	text: string
}