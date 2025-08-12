package algomarket.problemservice.adapter.webapi;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.UnsupportedEncodingException;

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

import algomarket.problemservice.domain.member.MemberInfoResponse;
import algomarket.problemservice.application.required.MemberRepository;
import algomarket.problemservice.domain.member.Member;
import algomarket.problemservice.domain.member.MemberFixture;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class MemberApiTest {

	@Autowired
	MockMvcTester mockMvcTester;

	@Autowired
	MemberRepository memberRepository;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	void register() throws JsonProcessingException, UnsupportedEncodingException {
		var request = MemberFixture.createMemberRegisterRequest();

		var result = mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.email", value -> assertThat(value).isEqualTo(request.email()))
			.hasPathSatisfying("$.username", value -> assertThat(value).isEqualTo(request.username()));

		MemberInfoResponse response =
			objectMapper.readValue(result.getResponse().getContentAsString(),  MemberInfoResponse.class);
		Member member = memberRepository.findById(response.memberId()).orElseThrow();

		assertThat(member.getEmail().address()).isEqualTo(response.email());
		assertThat(member.getUsername()).isEqualTo(response.username());
		assertThat(member.getPasswordHash()).isNotEqualTo(request.password());
	}

	@Test
	void register_withNullEmail() throws JsonProcessingException, UnsupportedEncodingException {
		var request = MemberFixture.createMemberRegisterRequest(null);

		var result = mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.email", value -> assertThat(value).isEmpty())
			.hasPathSatisfying("$.username", value -> assertThat(value).isEqualTo(request.username()));

		MemberInfoResponse response =
			objectMapper.readValue(result.getResponse().getContentAsString(),  MemberInfoResponse.class);
		Member member = memberRepository.findById(response.memberId()).orElseThrow();

		assertThat(member.getEmail().address()).isNull();
		assertThat(member.getUsername()).isEqualTo(response.username());
		assertThat(member.getPasswordHash()).isNotEqualTo(request.password());
	}

	@Test
	void register_withDuplicateEmail_fail() throws JsonProcessingException {
		var request = MemberFixture.createMemberRegisterRequest();
		mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		var result = mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CONFLICT);
	}

	@Test
	void register_withDuplicateUsername_fail() throws JsonProcessingException {
		var request1 = MemberFixture.createMemberRegisterRequest("abc@gmail.com", "user");
		mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request1)).exchange();
		var request2 = MemberFixture.createMemberRegisterRequest("hello@gmail.com", "user");

		var result = mockMvcTester.post().uri("/members").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request2)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CONFLICT);
	}
}
