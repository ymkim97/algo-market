package algomarket.problemservice.adapter.webapi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

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
	void login() {
		var registerRequest = MemberFixture.createMemberRegisterRequest();
	}
}
