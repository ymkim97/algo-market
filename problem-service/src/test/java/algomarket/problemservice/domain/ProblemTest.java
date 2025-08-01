package algomarket.problemservice.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemStatus;

class ProblemTest {

	@Test
	void createProblem() {
		var request = ProblemFixture.createProblemCreateRequest();

		Problem problem = Problem.create(request);

		assertThat(problem.getSubmitCount()).isZero();
		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.INSPECTING);
	}

	@ParameterizedTest
	@CsvSource(value = {"0.0, 512", "1.0, 0", "101.0, 1024", "10.0, 5121", "-1.0, -1"})
	void createProblemFailWithLimitSettings(Double timeLimit, Integer memoryLimit) {
		var requestWithInvalidLimit = ProblemFixture.createProblemCreateRequest(timeLimit, memoryLimit);

		assertThatThrownBy(() -> Problem.create(requestWithInvalidLimit)).isInstanceOf(IllegalStateException.class);
	}
}
