package algomarket.problemservice.application;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.MyProblemInfoResponse;
import algomarket.problemservice.application.dto.ProblemListResponse;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.domain.shared.Language;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemQueryService implements ProblemFinder {

	private final int PAGE_SIZE = 10;

	private final ProblemRepository problemRepository;
	private final SubmissionRepository submissionRepository;

	@Override
	public ProblemInfoResponse find(Long problemNumber) {
		Problem problem = problemRepository.findByNumber(problemNumber)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 번호입니다 - Number:" + problemNumber));

		return ProblemInfoResponse.from(problem);
	}

	@Override
	public ProblemInfoResponse findByTitle(String title) {
		Problem problem = problemRepository.findByTitle(title)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 제목입니다 - Title:" + title));

		return ProblemInfoResponse.from(problem);
	}

	@Override
	public Page<ProblemListResponse> listProblems(Integer pageNumber) {
		return problemRepository.findAll(PageRequest.of(pageNumber, PAGE_SIZE, Sort.by(Sort.Direction.ASC, "number")));
	}

	@Override
	public MyProblemInfoResponse findMyProblem(Long problemId, String username) {
		Problem problem = problemRepository.findByIdAndAuthorUsername(problemId, username)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 임시 저장입니다 - ID:" + problemId));

		return MyProblemInfoResponse.from(problem);
	}

	@Override
	public Page<MyProblemInfoResponse> listMyProblems(Integer pageNumber, String username) {
		Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE, Sort.by(Sort.Direction.ASC, "number"));

		Page<Problem> myProblems = problemRepository.findAllMyProblems(pageable, username);

		List<Long> draftProblemIds = myProblems.getContent().stream()
			.filter(Problem::isDraft)
			.map(Problem::getId)
			.toList();

		Map<Long, Set<Language>> solvedLanguagesForDraftByProblemId =
			submissionRepository.findSolvedLanguagesForDraftByProblemId(draftProblemIds).stream()
				.collect(Collectors.groupingBy(
					row -> (Long) row[0],
					Collectors.mapping(row -> (Language) row[1], Collectors.toSet())
				));

		List<MyProblemInfoResponse> responses = myProblems.getContent().stream()
			.map(problem -> MyProblemInfoResponse.of(problem, solvedLanguagesForDraftByProblemId.get(problem.getId())))
			.toList();

		return new PageImpl<>(responses, pageable, myProblems.getTotalElements());
	}
}
