package algomarket.problemservice.domain.problem;

import static org.springframework.util.Assert.state;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

	@Column(nullable = true, unique = true)
	private Long number;

	@Column(nullable = true,  unique = true, length = 100)
	private String title;

	@Column(nullable = false,  length = 30)
	private String authorUsername;

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

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = true, columnDefinition = "JSON")
	private List<ExampleTestCase> exampleTestCases;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = true, columnDefinition = "JSON")
	private List<TestCaseUrl> testCaseUrls;

	@Column(nullable = true)
	private LocalDateTime lastModified;

	public static Problem create(ProblemCreateRequest createRequest, String authorUsername) {
		Problem problem = new Problem();

		problem.title = createRequest.title();
		problem.authorUsername = Objects.requireNonNull(authorUsername);
		problem.description = Objects.requireNonNull(createRequest.description());
		problem.timeLimitSec = validateTimeLimit(createRequest.timeLimitSec());
		problem.memoryLimitMb = validateMemoryLimit(createRequest.memoryLimitMb());
		problem.exampleTestCases = createRequest.exampleTestCases();
		problem.testCaseUrls = createRequest.testCaseUrls();

		problem.number = null;
		problem.submitCount = 0;
		problem.problemStatus = ProblemStatus.DRAFT;
		problem.lastModified = LocalDateTime.now();

		return problem;
	}

	public void submit() {
		validateTestCaseCount();

		if (problemStatus == ProblemStatus.PUBLIC) {
			submitCount += 1;
		}
	}

	public void makePublic(Long problemNumber) {
		if (problemStatus == ProblemStatus.PUBLIC) {
			throw new IllegalStateException("이미 공개된 문제입니다.");
		}

		if (title.isBlank() || title.length() > 100) {
			throw new IllegalStateException("문제 제목은 1자 이상, 100자 이하이어야 합니다.");
		}

		if (description.isBlank()) {
			throw new IllegalStateException("문제 설명을 입력해주세요.");
		}

		validateTestCaseCount();

		problemStatus = ProblemStatus.PUBLIC;
		number = problemNumber;
	}

	public void modifyDraft(ProblemDraftModifyRequest modifyDraftRequest) {
		if (problemStatus != ProblemStatus.DRAFT) {
			throw new IllegalStateException("임시저장 상태가 아닌 문제입니다.");
		}

		title = Objects.requireNonNull(modifyDraftRequest.title());
		description = Objects.requireNonNull(modifyDraftRequest.description());
		timeLimitSec = validateTimeLimit(modifyDraftRequest.timeLimitSec());
		memoryLimitMb = validateMemoryLimit(modifyDraftRequest.memoryLimitMb());
		exampleTestCases = modifyDraftRequest.exampleTestCases();
		testCaseUrls = modifyDraftRequest.testCaseUrls();

		lastModified = LocalDateTime.now();
	}

	public boolean isDraft() {
		return problemStatus == ProblemStatus.DRAFT;
	}

	private static Double validateTimeLimit(Double timeLimit) {
		state(timeLimit > 0.0 && timeLimit <= 10.0, "시간 제한은 0초 초과, 10초 이하로 설정 가능합니다.");

		return timeLimit;
	}

	private static Integer validateMemoryLimit(Integer memoryLimit) {
		state(memoryLimit >= 128 && memoryLimit <= 512, "메모리 제한은 128MB 이상, 512MB 이하로 설정 가능합니다.");

		return memoryLimit;
	}

	private void validateTestCaseCount() {
		if (testCaseUrls.size() < 10) {
			throw new InsufficientTestCases("문제는 최소 10개 이상의 각각 입력, 출력 채점용 데이터가 필요합니다.");
		}
	}
}
