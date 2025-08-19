package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.dto.LoginRequest;

public interface AuthenticationHandler {

	String login(LoginRequest loginRequest);
}
