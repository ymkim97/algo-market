package algomarket.problemservice.domain.problem;

public record ProblemInfoResponse(
	Long problemId,

	String title,

	String description,

	Integer submitCount,

	Double timeLimit,

	Integer memoryLimit
) {
	public static ProblemInfoResponse from(Problem problem) {
		return new ProblemInfoResponse(problem.getId(), problem.getTitle(), problem.getDescription(), problem.getSubmitCount(),
			problem.getTimeLimitSec(), problem.getMemoryLimitMb());
	}
}
