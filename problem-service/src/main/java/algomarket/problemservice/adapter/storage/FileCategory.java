package algomarket.problemservice.adapter.storage;

import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public enum FileCategory {
	IMAGE(Set.of("png", "jpg", "jpeg", "gif", "svg"), "problems/%d/images/%s-%s"),
	TEST_DATA(Set.of("in", "out"), "problems/%d/test_data/%s");

	private final Set<String> extensions;
	private final String pathFormat;

	FileCategory(Set<String> extensions, String pathFormat) {
		this.extensions = extensions;
		this.pathFormat =  pathFormat;
	}

	public String createKey(Long problemId, String fileName) {
		Objects.requireNonNull(problemId);
		Objects.requireNonNull(fileName);

		String safeName = fileName.replaceAll("[^a-zA-Z0-9.-]", "_").trim();

		if (this == FileCategory.IMAGE) {
			String uuid =  UUID.randomUUID().toString();

			return String.format(pathFormat, problemId, uuid, safeName);
		}

		return  String.format(pathFormat, problemId, safeName);
	}

	public static FileCategory findByFileName(String nameOrExt) {
		String ext = extractExt(nameOrExt);

		return Arrays.stream(FileCategory.values())
			.filter(fileCategory -> fileCategory.extensions.contains(ext))
			.findAny()
			.orElseThrow(() -> new UnsupportedFileExtensionException("지원하지 않는 확장자입니다: " + ext));
	}

	private static String extractExt(String nameOrExt) {
		String s = nameOrExt == null ? "" : nameOrExt.trim();
		int dot = s.lastIndexOf('.');
		String ext = (dot >= 0 && dot < s.length() - 1) ? s.substring(dot + 1) : s;

		return ext.toLowerCase(Locale.ROOT);
	}
}
