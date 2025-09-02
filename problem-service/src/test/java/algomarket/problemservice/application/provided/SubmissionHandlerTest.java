package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.application.required.SubmissionEventHandler;

import algomarket.problemservice.application.event.JudgedEvent;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.ProblemFixture;
import algomarket.problemservice.domain.submission.Language;
import algomarket.problemservice.domain.submission.SubmitRequest;
import algomarket.problemservice.domain.submission.SubmitStatus;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
@Import(SubmissionHandlerTest.TestConfig.class)
class SubmissionHandlerTest {

	@Autowired
	SubmissionHandler submissionHandler;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	SubmissionRepository submissionRepository;

	@Autowired
	EntityManager entityManager;

	@Test
	void submit() {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfo = problemCreator.create(problemCreateRequest);
		entityManager.flush();
		entityManager.clear();

		var submitRequest = new SubmitRequest(problemInfo.problemId(), "Code", Language.JAVA);

		// when
		var submitResponse = submissionHandler.submit(submitRequest, "user");

		// then
		assertThat(submitResponse.submitStatus()).isEqualTo(SubmitStatus.JUDGING);
		assertThat(submitResponse.runtimeMs()).isNull();
		assertThat(submitResponse.memoryKb()).isNull();
	}

	@Test
	void finishSubmission() {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfo = problemCreator.create(problemCreateRequest);

		var submitRequest = new SubmitRequest(problemInfo.problemId(), "Code", Language.JAVA);
		var submitResponse = submissionHandler.submit(submitRequest, "user");
		entityManager.flush();
		entityManager.clear();

		var judgeEvent = new JudgedEvent(submitResponse.submissionId(), submitResponse.problemId(), "username", SubmitStatus.ACCEPTED, 100, 5400);

		// when
		submissionHandler.finishSubmission(judgeEvent);

		// then
		var submission = submissionRepository.findById(judgeEvent.submissionId()).orElseThrow();

		assertThat(submission).isNotNull();
		assertThat(submission.getRuntimeMs()).isEqualTo(100);
		assertThat(submission.getMemoryKb()).isEqualTo(5400);
	}

	@TestConfiguration
	static class TestConfig {
		@Bean
		public SubmissionEventHandler submissionEventHandler() {
			return submittedEvent -> {};
		}
	}
}
