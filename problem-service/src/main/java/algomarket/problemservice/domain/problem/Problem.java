package algomarket.problemservice.domain.problem;

import static org.springframework.util.Assert.state;

import java.util.Objects;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class Problem {

	private Long id;

	private String title;

	private String description;

	private Integer submitCount;

	private ProblemStatus problemStatus;

	// Second
	private Double timeLimit;

	// MB
	private Integer memoryLimit;

	public static Problem create(ProblemCreateRequest createRequest) {
		Problem problem = new Problem();

		problem.title = Objects.requireNonNull(createRequest.title());
		problem.description = Objects.requireNonNull(createRequest.description());
		problem.timeLimit = validateTimeLimit(createRequest.timeLimit());
		problem.memoryLimit = validateMemoryLimit(createRequest.memoryLimit());

		problem.submitCount = 0;
		problem.problemStatus = ProblemStatus.INSPECTING;

		return problem;
	}

	private static Double validateTimeLimit(Double timeLimit) {
		state(timeLimit > 0.0 && timeLimit <= 100.0, "시간 제한은 0초 초과, 100초 이하로 설정 가능합니다.");

		return timeLimit;
	}

	private static Integer validateMemoryLimit(Integer memoryLimit) {
		state(memoryLimit > 0 && memoryLimit <= 5120, "메모리 제한은 0MB 초과, 5120MB 이하로 설정 가능합니다.");

		return memoryLimit;
	}
}
