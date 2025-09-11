package algomarket.problemservice.application.provided;

import org.springframework.data.domain.Page;

import algomarket.problemservice.application.dto.MyProblemInfoResponse;
import algomarket.problemservice.application.dto.ProblemListResponse;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;

public interface ProblemFinder {

	ProblemInfoResponse find(Long problemNumber);

	Page<ProblemListResponse> listProblems(Integer pageNumber);

	MyProblemInfoResponse findMyProblem(Long problemId, String username);

	Page<MyProblemInfoResponse> listMyProblems(Integer pageNumber, String username);
}
