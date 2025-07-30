package algomarket.problemservice.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemStatus;

class ProblemTest {

	@Test
	void createProblem() {
		ProblemCreateRequest request = new ProblemCreateRequest("ABC Title", "This is description", 1.0, 512);

		Problem problem = Problem.create(request);

		assertThat(problem.getSubmitCount()).isZero();
		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.INSPECTING);
	}

	@ParameterizedTest
	@CsvSource(value = {"0.0, 512", "1.0, 0", "101.0, 1024", "10.0, 5121"})
	void createProblemFailWithLimitSettings(Double timeLimit, Integer memoryLimit) {
		ProblemCreateRequest requestWithInvalidLimit = new ProblemCreateRequest("ABC Title", "This is description", timeLimit, memoryLimit);

		assertThatThrownBy(() -> Problem.create(requestWithInvalidLimit))
		    .isInstanceOf(IllegalStateException.class);
	}
}
