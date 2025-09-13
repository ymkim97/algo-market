package algomarket.problemservice.domain.problem;

public record ProblemInfoResponse(
	Long problemId,

	Long problemNumber,

	String title,

	String description,

	Integer submitCount,

	Double timeLimit,

	Integer memoryLimit
) {
	public static ProblemInfoResponse from(Problem problem) {
		return new ProblemInfoResponse(problem.getId(), problem.getNumber(), problem.getTitle(), problem.getDescription(), problem.getSubmitCount(),
			problem.getTimeLimitSec(), problem.getMemoryLimitMb());
	}
}
