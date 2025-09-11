package algomarket.problemservice.application.dto;

public record ProblemListResponse(
	Long problemId,

	Long problemNumber,

	String title,

	Integer submitCount
) {
}
