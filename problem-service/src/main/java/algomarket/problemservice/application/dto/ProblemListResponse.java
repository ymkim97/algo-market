package algomarket.problemservice.application.dto;

public record ProblemListResponse(
	Long problemNumber,

	String title,

	Integer submitCount,

	Boolean isSolved
) {
}
