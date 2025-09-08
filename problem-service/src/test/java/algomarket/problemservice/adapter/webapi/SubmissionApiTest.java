package algomarket.problemservice.adapter.webapi;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.ProgressNotifier;
import algomarket.problemservice.application.required.ProgressSubscriber;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemFixture;
import algomarket.problemservice.domain.submission.Language;
import algomarket.problemservice.domain.submission.SubmitRequest;
import algomarket.problemservice.domain.submission.SubmitStatus;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class SubmissionApiTest {

	@Autowired
	ObjectMapper objectMapper;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	ProgressNotifier progressNotifier;

	@Autowired
	MockMvcTester mockMvcTester;

	@Autowired
	ProblemRepository problemRepository;

	@MockitoBean
	ProgressSubscriber progressSubscriber;

	@Test
	@WithMockUser
	void submit() throws Exception {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfo = problemCreator.create(problemCreateRequest);

		var submitRequest = new SubmitRequest(problemInfo.problemId(), "System.out.println(\"Hello\");", Language.JAVA);

		// when
		var result = mockMvcTester.post().uri("/submissions")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(submitRequest))
			.exchange();

		//then
		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.submissionId", value -> assertThat(value).isNotNull())
			.hasPathSatisfying("$.submitStatus", value -> assertThat(value).isEqualTo(SubmitStatus.JUDGING.toString()))
			.hasPathSatisfying("$.runtimeMs",  value -> assertThat(value).isNull())
			.hasPathSatisfying("$.memoryKb",  value -> assertThat(value).isNull());
	}

	@Test
	@WithMockUser
	void submit_shouldIncreaseSubmitCount() throws JsonProcessingException {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfo = problemCreator.create(problemCreateRequest);

		var submitRequest = new SubmitRequest(problemInfo.problemId(), "System.out.println(\"Hello\");", Language.JAVA);

		// when
		mockMvcTester.post().uri("/submissions")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(submitRequest))
			.exchange();

		// then
		Problem problem = problemRepository.findById(problemInfo.problemId()).orElseThrow();

		assertThat(problem.getSubmitCount()).isEqualTo(1);
	}

	@Test
	@WithMockUser
	void submit_withInvalidRequest() throws Exception {
		// given
		var invalidRequest = new SubmitRequest(1L, "", Language.JAVA);

		// when
		var result = mockMvcTester.post().uri("/submissions")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(invalidRequest))
			.exchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.BAD_REQUEST);
	}

	@Test
	@WithMockUser
	void progress() throws JsonProcessingException {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfo = problemCreator.create(problemCreateRequest);
		var submitRequest = new SubmitRequest(problemInfo.problemId(), "System.out.println(\"Hello\");", Language.JAVA);

		mockMvcTester.post().uri("/submissions")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(submitRequest))
			.exchange();

		// when
		var result = mockMvcTester.get().uri(String.format("/submissions/%d/progress", problemInfo.problemId())).asyncExchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.OK);

		var emitters = (Map<?, ?>) ReflectionTestUtils.getField(progressNotifier, "emitters");

		assertThat(emitters).hasSize(1);

		emitters.clear();
	}
}
