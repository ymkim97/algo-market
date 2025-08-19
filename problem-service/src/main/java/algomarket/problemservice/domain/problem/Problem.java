package algomarket.problemservice.domain.problem;

import static org.springframework.util.Assert.state;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@Entity
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class Problem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false,  unique = true, length = 100)
	private String title;

	@Column(nullable = false, columnDefinition = "MEDIUMTEXT")
	private String description;

	@Column(nullable = false)
	private Integer submitCount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProblemStatus problemStatus;

	// Second
	@Column(nullable = false)
	private Double timeLimit;

	// MB
	@Column(nullable = false)
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
