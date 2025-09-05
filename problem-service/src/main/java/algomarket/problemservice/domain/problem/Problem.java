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
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

	@Column(nullable = false)
	private Double timeLimitSec;

	@Column(nullable = false)
	private Integer memoryLimitMb;

	public static Problem create(ProblemCreateRequest createRequest) {
		Problem problem = new Problem();

		problem.title = Objects.requireNonNull(createRequest.title());
		problem.description = Objects.requireNonNull(createRequest.description());
		problem.timeLimitSec = validateTimeLimit(createRequest.timeLimitSec());
		problem.memoryLimitMb = validateMemoryLimit(createRequest.memoryLimitMb());

		problem.submitCount = 0;
		problem.problemStatus = ProblemStatus.INSPECTING;

		return problem;
	}

	private static Double validateTimeLimit(Double timeLimit) {
		state(timeLimit > 0.0 && timeLimit <= 10.0, "시간 제한은 0초 초과, 10초 이하로 설정 가능합니다.");

		return timeLimit;
	}

	private static Integer validateMemoryLimit(Integer memoryLimit) {
		state(memoryLimit >= 128 && memoryLimit <= 512, "메모리 제한은 128MB 이상, 512MB 이하로 설정 가능합니다.");

		return memoryLimit;
	}
}
