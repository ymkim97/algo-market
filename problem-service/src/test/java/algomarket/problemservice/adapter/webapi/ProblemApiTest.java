package algomarket.problemservice.adapter.webapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.io.UnsupportedEncodingException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemFixture;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
@WithMockUser
class ProblemApiTest {

	@Autowired
	MockMvcTester mockMvcTester;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	ProblemRepository problemRepository;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	void create() throws JsonProcessingException, UnsupportedEncodingException {
		var request = ProblemFixture.createProblemCreateRequest();

		var result = mockMvcTester.post().uri("/problems").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.problemId", value -> assertThat(value).isNotNull())
			.hasPathSatisfying("$.title", value -> assertThat(value).isEqualTo(request.title()));

		ProblemInfoResponse response =
			objectMapper.readValue(result.getResponse().getContentAsString(), ProblemInfoResponse.class);
		Problem problem = problemRepository.findById(response.problemId()).orElseThrow();

		assertThat(problem.getId()).isEqualTo(response.problemId());
		assertThat(problem.getTitle()).isEqualTo(request.title());
		assertThat(problem.getDescription()).isEqualTo(request.description());
		assertThat(problem.getSubmitCount()).isZero();
	}

	@Test
	void create_withDuplicateTitle_fail() throws JsonProcessingException {
		var request =  ProblemFixture.createProblemCreateRequest();
		problemCreator.create(request);

		var result =  mockMvcTester.post().uri("/problems").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.apply(print())
			.hasStatus(HttpStatus.CONFLICT);
	}

	@Test
	void find() {
		var problemInfoResponse = problemCreator.create(ProblemFixture.createProblemCreateRequest());
		Long problemId = problemInfoResponse.problemId();

		var result = mockMvcTester.get().uri("/problems/{problemId}", problemId).contentType(MediaType.APPLICATION_JSON)
			.exchange();

		assertThat(result)
			.hasStatus(HttpStatus.OK)
			.bodyJson()
			.hasPathSatisfying("$.problemId", value -> assertThat(value).isEqualTo(problemInfoResponse.problemId().intValue()))
			.hasPathSatisfying("$.title", value -> assertThat(value).isEqualTo(problemInfoResponse.title()));
	}
}
