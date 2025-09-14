package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import algomarket.problemservice.application.ProblemModifyService;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemFixture;
import algomarket.problemservice.domain.problem.ProblemStatus;
import algomarket.problemservice.domain.shared.Language;
import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitRequest;
import algomarket.problemservice.domain.submission.SubmitStatus;

@ExtendWith(MockitoExtension.class)
class ProblemCreatorTest {

	@Mock
	ProblemRepository problemRepository;

	@Mock
	SubmissionRepository submissionRepository;

	ProblemCreator problemCreator;

	@BeforeEach
	void setUp() {
		problemCreator = new ProblemModifyService(problemRepository, submissionRepository);
	}

	@Test
	void create() {
		// given
		var request = ProblemFixture.createProblemCreateRequest();
		given(problemRepository.existsByTitleAndIdNot(request.title(), null)).willReturn(false);
		given(problemRepository.save(any(Problem.class))).willAnswer(invocation -> invocation.getArgument(0));

		// when
		var problemInfoResponse = problemCreator.create(request, "username");

		// then
		verify(problemRepository).save(any(Problem.class));
		assertThat(problemInfoResponse.problemNumber()).isNull();
		assertThat(problemInfoResponse.submitCount()).isZero();
	}

	@Test
	void create_withDuplicateTitle_fail() {
		// given
		var request = ProblemFixture.createProblemCreateRequest("ABC", 1.5, 128);
		given(problemRepository.existsByTitleAndIdNot(request.title(), null)).willReturn(true);

		// when & then
		assertThatThrownBy(() -> problemCreator.create(request, "username")).isInstanceOf(DuplicateTitleException.class);
	}

	@Test
	void makePublic() {
		// given
		Long problemId = 1L;
		String username = "username";

		List<Submission> submissions = List.of(
			Submission.submit(new SubmitRequest(problemId, "Code", Language.JAVA), username),
			Submission.submit(new SubmitRequest(problemId, "Code", Language.PYTHON), username)
		);
		ReflectionTestUtils.setField(submissions.getFirst(), "submitStatus", SubmitStatus.ACCEPTED);
		ReflectionTestUtils.setField(submissions.get(1), "submitStatus", SubmitStatus.ACCEPTED);

		Problem problem = Problem.create(ProblemFixture.createProblemCreateRequest(), username);
		given(problemRepository.findByIdAndAuthorUsername(problemId, username)).willReturn(Optional.of(problem));

		given(problemRepository.findMaxProblemNumber()).willReturn(100L);
		given(submissionRepository.findAllByProblemIdAndUsername(problemId, username)).willReturn(submissions);
		given(problemRepository.save(any(Problem.class))).willAnswer(invocation -> invocation.getArgument(0));

		// when
		problemCreator.makePublic(problemId, username);

		// then
		verify(problemRepository).save(any(Problem.class));
		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.PUBLIC);
		assertThat(problem.getNumber()).isEqualTo(101L);
	}
}
