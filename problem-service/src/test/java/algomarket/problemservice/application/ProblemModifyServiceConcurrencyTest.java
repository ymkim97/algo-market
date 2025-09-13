package algomarket.problemservice.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemStatus;
import algomarket.problemservice.domain.shared.Language;
import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitRequest;
import algomarket.problemservice.domain.submission.SubmitStatus;

@SpringBootTest
class ProblemModifyServiceConcurrencyTest {

	@Autowired
	ProblemModifyService problemModifyService;

	@Autowired
	ProblemRepository problemRepository;

	@Autowired
	SubmissionRepository submissionRepository;

	@Test
	void makePublic_with100ConcurrentRequest_shouldNumberBeCorrect() throws Exception {
		// given
		String authorUsername = "testuser";
		int threadCount = 100;

		List<Long> problemIds = new ArrayList<>();
		for (int i = 0; i < threadCount; i++) {
			Problem problem = Problem.create(
				new ProblemCreateRequest(
					"Test Problem " + i,
					"Test Description " + i,
					1.0,
					256
				),
				authorUsername
			);
			problemIds.add(problemRepository.save(problem).getId());
		}

		for (Long problemId : problemIds) {
			submissionRepository.save(createSuccessfulSubmission(problemId, authorUsername, Language.JAVA));
			submissionRepository.save(createSuccessfulSubmission(problemId, authorUsername, Language.PYTHON));
		}

		try (ExecutorService executorService = Executors.newFixedThreadPool(threadCount)) {
			CountDownLatch latch = new CountDownLatch(threadCount);
			List<Exception> exceptions = Collections.synchronizedList(new ArrayList<>());

			// when - 100개 스레드가 동시에 makePublic 호출
			for (Long problemId : problemIds) {
				executorService.submit(() -> {
					try {
						problemModifyService.makePublic(problemId, authorUsername);
					} catch (Exception e) {
						exceptions.add(e);
					} finally {
						latch.countDown();
					}
				});
			}

			boolean completed = latch.await(10, TimeUnit.SECONDS);

			// then
			assertThat(completed).isTrue();
			assertThat(exceptions).isEmpty();

			// 모든 문제가 공개되었는지 확인하고 번호가 고유한지 검증
			List<Problem> allProblems = new ArrayList<>();
			for (Long problemId : problemIds) {
				allProblems.add(problemRepository.findById(problemId).orElseThrow());
			}

			// 모든 문제가 PUBLIC 상태인지 확인
			List<Problem> publicProblems = allProblems.stream()
				.filter(p -> p.getProblemStatus() == ProblemStatus.PUBLIC)
				.collect(Collectors.toList());

			assertThat(publicProblems).hasSize(threadCount);

			// 모든 문제 번호가 고유한지 확인 (race condition 검증)
			Set<Long> problemNumbers = publicProblems.stream()
				.map(Problem::getNumber)
				.collect(Collectors.toSet());

			assertThat(problemNumbers).hasSize(threadCount);

			// 문제 번호가 연속적인지 확인
			Long minNumber = Collections.min(problemNumbers);
			Long maxNumber = Collections.max(problemNumbers);
			assertThat(maxNumber - minNumber + 1).isEqualTo(threadCount);
		}
	}

	private Submission createSuccessfulSubmission(Long problemId, String username, Language language) {
		SubmitRequest submitRequest = new SubmitRequest(problemId, "test code", language);
		Submission submission = Submission.submit(submitRequest, username);
		submission.updateStatus(SubmitStatus.ACCEPTED, 100, 1024);
		return submission;
	}
}
