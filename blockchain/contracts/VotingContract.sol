// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VotingContract - VoteIQ Decentralised Election System
 * @dev One wallet = one vote. Fully on-chain, immutable results.
 */
contract VotingContract is Ownable, ReentrancyGuard {

    // ─── Data Structures ──────────────────────────────────────────

    struct Candidate {
        uint256 id;
        string  name;
        string  party;
        string  symbol;      // emoji symbol e.g. "🪷"
        uint256 voteCount;
        bool    isActive;
    }

    struct Election {
        uint256  id;
        string   name;        // "Lok Sabha 2024"
        string   constituency;
        uint256  startTime;
        uint256  endTime;
        bool     isActive;
        uint256  totalVotes;
        string   metadataIPFS;  // IPFS CID for election details
    }

    // ─── State ────────────────────────────────────────────────────

    uint256 public electionCount;
    uint256 public candidateCount;

    // electionId => Election
    mapping(uint256 => Election) public elections;

    // electionId => candidateId => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;

    // electionId => list of candidate IDs
    mapping(uint256 => uint256[]) public electionCandidates;

    // electionId => voter address => has voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // electionId => voter address => which candidateId they voted for
    mapping(uint256 => mapping(address => uint256)) public voterChoice;

    // ─── Events ───────────────────────────────────────────────────

    event ElectionCreated(uint256 indexed electionId, string name, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name, string party);
    event ElectionEnded(uint256 indexed electionId, uint256 winnerCandidateId);

    // ─── Modifiers ────────────────────────────────────────────────

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election does not exist");
        _;
    }

    modifier electionOpen(uint256 _electionId) {
        Election storage e = elections[_electionId];
        require(block.timestamp >= e.startTime, "Election has not started");
        require(block.timestamp <= e.endTime,   "Election has ended");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Owner Functions ──────────────────────────────────────────

    function createElection(
        string calldata _name,
        string calldata _constituency,
        uint256 _startTime,
        uint256 _endTime,
        string calldata _metadataIPFS
    ) external onlyOwner returns (uint256) {
        require(_endTime > _startTime, "End must be after start");
        require(_startTime >= block.timestamp, "Start must be in future");

        electionCount++;
        uint256 id = electionCount;

        elections[id] = Election({
            id: id,
            name: _name,
            constituency: _constituency,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            totalVotes: 0,
            metadataIPFS: _metadataIPFS
        });

        emit ElectionCreated(id, _name, _startTime, _endTime);
        return id;
    }

    function addCandidate(
        uint256 _electionId,
        string calldata _name,
        string calldata _party,
        string calldata _symbol
    ) external onlyOwner electionExists(_electionId) returns (uint256) {
        candidateCount++;
        uint256 cid = candidateCount;

        candidates[_electionId][cid] = Candidate({
            id: cid,
            name: _name,
            party: _party,
            symbol: _symbol,
            voteCount: 0,
            isActive: true
        });

        electionCandidates[_electionId].push(cid);
        emit CandidateAdded(_electionId, cid, _name, _party);
        return cid;
    }

    // ─── Core Voting Function ─────────────────────────────────────

    function castVote(uint256 _electionId, uint256 _candidateId)
        external
        nonReentrant
        electionExists(_electionId)
        electionOpen(_electionId)
    {
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(candidates[_electionId][_candidateId].isActive, "Candidate not valid");

        // Record vote — immutably on chain
        hasVoted[_electionId][msg.sender] = true;
        voterChoice[_electionId][msg.sender] = _candidateId;
        candidates[_electionId][_candidateId].voteCount++;
        elections[_electionId].totalVotes++;

        emit VoteCast(_electionId, msg.sender, _candidateId, block.timestamp);
    }

    // ─── Read Functions ───────────────────────────────────────────

    function getResults(uint256 _electionId)
        external view
        returns (uint256[] memory ids, string[] memory names, uint256[] memory votes)
    {
        uint256[] memory cids = electionCandidates[_electionId];
        uint256 len = cids.length;

        ids   = new uint256[](len);
        names = new string[](len);
        votes = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            Candidate storage c = candidates[_electionId][cids[i]];
            ids[i]   = c.id;
            names[i] = c.name;
            votes[i] = c.voteCount;
        }
    }

    function getWinner(uint256 _electionId) external view returns (uint256 winnerId, string memory winnerName, uint256 winnerVotes) {
        require(block.timestamp > elections[_electionId].endTime, "Election still ongoing");

        uint256[] memory cids = electionCandidates[_electionId];
        for (uint256 i = 0; i < cids.length; i++) {
            Candidate storage c = candidates[_electionId][cids[i]];
            if (c.voteCount > winnerVotes) {
                winnerVotes = c.voteCount;
                winnerId    = c.id;
                winnerName  = c.name;
            }
        }
    }
}
