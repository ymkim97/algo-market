package algomarket.problemservice.domain.problem;

public record ProblemCreateRequest(
	String title,

	String description,

	Double timeLimit,

	Integer memoryLimit
) {

}
