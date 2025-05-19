#
# Copyright (c) nexB Inc. and others. All rights reserved.
# purldb is a trademark of nexB Inc.
# SPDX-License-Identifier: Apache-2.0
# See http://www.apache.org/licenses/LICENSE-2.0 for the license text.
# See https://github.com/aboutcode-org/matchcode-tests for support or download.
# See https://aboutcode.org for more information about nexB OSS projects.
#

import os
from collections import defaultdict

from commoncode.fileutils import delete
from commoncode.testcase import FileBasedTesting
from commoncode.testcase import check_against_expected_json_file
from matchcode_toolkit.fingerprinting import create_file_fingerprints
from matchcode_toolkit.fingerprinting import get_file_fingerprint_hashes
from matchcode_toolkit.fingerprinting import split_fingerprint
from matchcode_toolkit.stemming import get_stem_code
from samecode.halohash import byte_hamming_distance


def get_stemmed_file_fingerprint_hashes(
    location, ngram_length=5, window_length=16, include_ngrams=False, **kwargs
):
    """
    Return a mapping of fingerprint hashes for the file at `location`, after
    stemming the content.

    The `halo1` hash is the hex digest of the fingerprint of the file.
    `halo1` is empty if the file is empty.

    - We start by breaking the file into words (tokens)
    - We compute ngrams over the list of tokens

    Return an empty mapping if `location` is not a text file
    """
    from commoncode import filetype
    from typecode.contenttype import get_type

    # Do not process `location` if it's not a text file
    ft = get_type(location)
    if not (filetype.is_file(location) and ft.is_text):
        return {}

    content = get_stem_code(location)
    return create_file_fingerprints(
        content,
        ngram_length=ngram_length,
        window_length=window_length,
        include_ngrams=include_ngrams,
    )


class TestMatchcode(FileBasedTesting):
    test_data_dir = os.path.join(os.path.dirname(__file__), "data")

    def setUp(self):
        super().setUp()
        data_zip_loc = self.get_test_loc("data.zip")
        self.test_data_loc = self.extract_test_zip(data_zip_loc)

    def tearDown(self):
        super().tearDown()
        delete(self.test_data_loc)

    def _test_snippets_similarity_ai_gen_code(self, problem, stemmed=False, regen=False):
        def create_snippet_mappings_by_snippets(snippets):
            snippet_mappings_by_snippet = defaultdict(list)
            for s in snippets:
                snippet = s["snippet"]
                snippet_mappings_by_snippet[snippet].append(s)
            return snippet_mappings_by_snippet

        temps = [0, 0.5, 1]
        llms = ["gpt4", "gpt_3.5_turbo"]
        code_gen_types = ["cppToJava", "java", "java_regular", "pythonToJava"]
        solution_loc = f"{self.test_data_loc}/data/{problem}/Solution.java"
        solution_loc = self.get_test_loc(solution_loc)
        if stemmed:
            solution_results = get_stemmed_file_fingerprint_hashes(
                solution_loc, include_ngrams=True
            )
        else:
            solution_results = get_file_fingerprint_hashes(solution_loc, include_ngrams=True)
        solution_halo1 = solution_results.get("halo1")
        solution_snippets = solution_results.get("snippets")
        _, solution_fingerprint_hash = split_fingerprint(solution_halo1)
        solution_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(
            solution_snippets
        )

        results = []
        for temp in temps:
            for llm in llms:
                for code_gen_type in code_gen_types:
                    for i in range(1, 21):
                        test_file_relative_path = f"data/{problem}/{temp}/{llm}/{code_gen_type}/repeated/llm_generated/generated_{i}.java"
                        test_file_loc = f"{self.test_data_loc}/{test_file_relative_path}"
                        gen_solution = self.get_test_loc(test_file_loc)
                        if stemmed:
                            gen_results = get_stemmed_file_fingerprint_hashes(
                                gen_solution, include_ngrams=True
                            )
                        else:
                            gen_results = get_file_fingerprint_hashes(
                                gen_solution, include_ngrams=True
                            )
                        gen_halo1 = gen_results.get("halo1")
                        gen_snippets = gen_results.get("snippets")

                        _, gen_fingerprint_hash = split_fingerprint(gen_halo1)
                        gen_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(
                            gen_snippets
                        )

                        distance = byte_hamming_distance(
                            solution_fingerprint_hash, gen_fingerprint_hash
                        )
                        snippet_results = (
                            solution_snippet_mappings_by_snippets.keys()
                            & gen_snippet_mappings_by_snippets.keys()
                        )

                        snippets_matched_to_solution = []
                        for snippet in snippet_results:
                            snippets_matched_to_solution.extend(
                                solution_snippet_mappings_by_snippets[snippet]
                            )

                        snippets_matched_to_gen = []
                        for snippet in snippet_results:
                            snippets_matched_to_gen.extend(
                                gen_snippet_mappings_by_snippets[snippet]
                            )

                        results.append(
                            {
                                "test_file": test_file_relative_path,
                                "distance": distance,
                                "snippets_matched_to_solution": sorted(
                                    snippets_matched_to_solution, key=lambda x: x["position"]
                                ),
                                "snippets_matched_to_gen": sorted(
                                    snippets_matched_to_gen, key=lambda x: x["position"]
                                ),
                            }
                        )

        if stemmed:
            expected_results_loc = self.get_test_loc(f"{problem}-stemmed-expected.json")
        else:
            expected_results_loc = self.get_test_loc(f"{problem}-expected.json")
        sorted_results = sorted(results, key=lambda x: x["test_file"])
        check_against_expected_json_file(sorted_results, expected_results_loc, regen=regen)

    def test_snippets_similarity_ai_gen_code_bob_alice_flower(self):
        self._test_snippets_similarity_ai_gen_code("bob_alice_flower", regen=False)

    def test_snippets_similarity_ai_gen_code_find_equalindromic(self):
        self._test_snippets_similarity_ai_gen_code("find_equalindromic", regen=False)

    def test_snippets_similarity_ai_gen_code_find_indices(self):
        self._test_snippets_similarity_ai_gen_code("find_indices", regen=False)

    def test_snippets_similarity_ai_gen_code_find_polygon(self):
        self._test_snippets_similarity_ai_gen_code("find_polygon", regen=False)

    def test_snippets_similarity_ai_gen_code_max_num_elements_subsets(self):
        self._test_snippets_similarity_ai_gen_code("max_num_elements_subsets", regen=False)

    def test_snippets_similarity_ai_gen_code_max_num_ops(self):
        self._test_snippets_similarity_ai_gen_code("max_num_ops", regen=False)

    def test_snippets_similarity_ai_gen_code_max_set_removals(self):
        self._test_snippets_similarity_ai_gen_code("max_set_removals", regen=False)

    def test_snippets_similarity_ai_gen_code_min_len_ops(self):
        self._test_snippets_similarity_ai_gen_code("min_len_ops", regen=False)

    def test_snippets_similarity_ai_gen_code_min_moves_queen(self):
        self._test_snippets_similarity_ai_gen_code("min_moves_queen", regen=False)

    def test_snippets_similarity_ai_gen_code_min_time_revert(self):
        self._test_snippets_similarity_ai_gen_code("min_time_revert", regen=False)

    def test_snippets_similarity_ai_gen_code_bob_alice_flower_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("bob_alice_flower", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_find_equalindromic_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("find_equalindromic", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_find_indices_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("find_indices", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_find_polygon_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("find_polygon", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_max_num_elements_subsets_stemmed(self):
        self._test_snippets_similarity_ai_gen_code(
            "max_num_elements_subsets", stemmed=True, regen=False
        )

    def test_snippets_similarity_ai_gen_code_max_num_ops_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("max_num_ops", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_max_set_removals_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("max_set_removals", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_min_len_ops_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("min_len_ops", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_min_moves_queen_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("min_moves_queen", stemmed=True, regen=False)

    def test_snippets_similarity_ai_gen_code_min_time_revert_stemmed(self):
        self._test_snippets_similarity_ai_gen_code("min_time_revert", stemmed=True, regen=False)


class TestMatchcode2(FileBasedTesting):
    test_data_dir = os.path.join(os.path.dirname(__file__), "data")

    def setUp(self):
        super().setUp()
        data_zip_loc = self.get_test_loc("Dataset.zip")
        self.test_data_loc = self.extract_test_zip(data_zip_loc)

    def tearDown(self):
        super().tearDown()
        delete(self.test_data_loc)

    def _test_snippets_similarity_ai_gen_code(self, stemmed=False, regen=False):
        def create_snippet_mappings_by_snippets(snippets):
            snippet_mappings_by_snippet = defaultdict(list)
            for s in snippets:
                snippet = s["snippet"]
                snippet_mappings_by_snippet[snippet].append(s)
            return snippet_mappings_by_snippet

        results = []
        # 1. get solutions to see which files we can actually compare
        for i in range(1, 29):
            solution_files_dir = f"{self.test_data_loc}/Dataset/Control/Human{i}"
            test_files_dir = f"{self.test_data_loc}/Dataset/Autopilot/Machine{i}"
            solution_file_names = [
                f
                for f in os.listdir(solution_files_dir)
                if f != ".DS_Store" and os.path.isfile(os.path.join(solution_files_dir, f))
            ]
            solution_file_basenames = []
            solution_file_names_by_basenames = {}
            for solution_file_name in solution_file_names:
                solution_file_basename, _ = solution_file_name.split("_")
                solution_file_basenames.append(solution_file_basename)
                solution_file_names_by_basenames[solution_file_basename] = solution_file_name

            test_file_names = [
                f
                for f in os.listdir(test_files_dir)
                if f != ".DS_Store" and os.path.isfile(os.path.join(test_files_dir, f))
            ]
            test_file_basenames = []
            test_file_names_by_basenames = {}
            for test_file_name in test_file_names:
                test_file_basename, _ = test_file_name.split("_")
                test_file_basenames.append(test_file_basename)
                test_file_names_by_basenames[test_file_basename] = test_file_name

            common_file_basenames = list(set(solution_file_basenames) & set(test_file_basenames))

            for common_file_basename in common_file_basenames:
                solution_file_name = solution_file_names_by_basenames[common_file_basename]
                solution_file_loc = f"{solution_files_dir}/{solution_file_name}"
                if stemmed:
                    solution_results = get_stemmed_file_fingerprint_hashes(
                        solution_file_loc, include_ngrams=True
                    )
                else:
                    solution_results = get_file_fingerprint_hashes(
                        solution_file_loc, include_ngrams=True
                    )
                solution_halo1 = solution_results.get("halo1")
                solution_snippets = solution_results.get("snippets")
                _, solution_fingerprint_hash = split_fingerprint(solution_halo1)
                solution_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(
                    solution_snippets
                )

                test_file_name = test_file_names_by_basenames[common_file_basename]
                test_file_relative_path = f"Dataset/Autopilot/Machine{i}/{test_file_name}"
                test_file_loc = f"{self.test_data_loc}/{test_file_relative_path}"
                if stemmed:
                    gen_results = get_stemmed_file_fingerprint_hashes(
                        test_file_loc, include_ngrams=True
                    )
                else:
                    gen_results = get_file_fingerprint_hashes(test_file_loc, include_ngrams=True)
                gen_halo1 = gen_results.get("halo1")
                gen_snippets = gen_results.get("snippets")
                _, gen_fingerprint_hash = split_fingerprint(gen_halo1)
                gen_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(gen_snippets)

                distance = byte_hamming_distance(solution_fingerprint_hash, gen_fingerprint_hash)
                snippet_results = (
                    solution_snippet_mappings_by_snippets.keys()
                    & gen_snippet_mappings_by_snippets.keys()
                )

                snippets_matched_to_solution = []
                for snippet in snippet_results:
                    snippets_matched_to_solution.extend(
                        solution_snippet_mappings_by_snippets[snippet]
                    )

                snippets_matched_to_gen = []
                for snippet in snippet_results:
                    snippets_matched_to_gen.extend(gen_snippet_mappings_by_snippets[snippet])

                results.append(
                    {
                        "test_file": test_file_relative_path,
                        "distance": distance,
                        "snippets_matched_to_solution": sorted(
                            snippets_matched_to_solution, key=lambda x: x["position"]
                        ),
                        "snippets_matched_to_gen": sorted(
                            snippets_matched_to_gen, key=lambda x: x["position"]
                        ),
                    }
                )

        if stemmed:
            expected_results_loc = self.get_test_loc("Dataset-stemmed-expected.json")
        else:
            expected_results_loc = self.get_test_loc("Dataset-expected.json")
        check_against_expected_json_file(
            sorted(results, key=lambda x: x["test_file"]), expected_results_loc, regen=regen
        )

    def test_snippets_similarity_ai_gen_code(self, regen=False):
        self._test_snippets_similarity_ai_gen_code(stemmed=False, regen=regen)

    def test_snippets_similarity_ai_gen_code_stemmed(self, regen=False):
        self._test_snippets_similarity_ai_gen_code(stemmed=True, regen=regen)
