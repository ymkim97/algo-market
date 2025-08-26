package algomarket.problemservice.adapter.webapi;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.dto.LoginRequest;
import algomarket.problemservice.application.provided.MemberRegister;
import algomarket.problemservice.domain.member.MemberFixture;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class AuthenticationApiTest {

	@Autowired
	MockMvcTester mockMvcTester;

	@Autowired
	MemberRegister memberRegister;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	void login() throws JsonProcessingException {
		// given
		var registerRequest = MemberFixture.createMemberRegisterRequest();
		memberRegister.register(registerRequest);

		var loginRequest = new LoginRequest(registerRequest.username(), registerRequest.password());

		// when
		var result =  mockMvcTester.post().uri("/login").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(loginRequest)).exchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.OK)
			.containsHeader("Authorization");
		assertThat(result.getResponse().getHeader("Authorization")).startsWith("Bearer ");
	}
}
