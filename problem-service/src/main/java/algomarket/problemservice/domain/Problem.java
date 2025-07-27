package algomarket.problemservice.domain;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class Problem {

	private String title;

	private String description;

	private Integer submitCount;

	private ProblemStatus problemStatus;

	public static Problem create(ProblemCreateRequest createRequest) {
		Problem problem = new Problem();

		problem.title = createRequest.title();
		problem.description = createRequest.description();

		problem.submitCount = 0;
		problem.problemStatus = ProblemStatus.INSPECTING;

		return problem;
	}
}
