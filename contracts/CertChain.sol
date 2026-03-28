// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertChain {
    struct Certificate {
        bytes32 contentHash;
        string institution;
        uint256 timestamp;
        uint256 blockNumber;
        bool exists;
        bool isRevoked;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bool) public authorizedInstitutions;
    address public owner;

    struct Institution {
        string name;
        bytes32 passwordHash;
        bool isRegistered;
        uint256 registeredAt;
        uint256 credits;
    }

    mapping(string => Institution) public registeredInstitutions;
    mapping(string => bytes32) public credentialToHash;

    event CertificateIssued(bytes32 indexed hash, string credentialId, string institution, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed hash, uint256 timestamp);
    event InstitutionAuthorized(address indexed institution);
    event InstitutionRevoked(address indexed institution);
    event InstitutionRegistered(string name, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedInstitutions[msg.sender], "Auth: caller is not authorized to issue");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeInstitution(address _institution) public onlyOwner {
        authorizedInstitutions[_institution] = true;
        emit InstitutionAuthorized(_institution);
    }

    function revokeInstitution(address _institution) public onlyOwner {
        authorizedInstitutions[_institution] = false;
        emit InstitutionRevoked(_institution);
    }

    function registerInstitutionData(string memory _name, bytes32 _passwordHash) public onlyOwner {
        require(!registeredInstitutions[_name].isRegistered, "Institution already registered");

        registeredInstitutions[_name] = Institution({
            name: _name,
            passwordHash: _passwordHash,
            isRegistered: true,
            registeredAt: block.timestamp,
            credits: 0 
        });

        emit InstitutionRegistered(_name, block.timestamp);
    }

    function removeInstitution(string memory _name) public onlyOwner {
        require(registeredInstitutions[_name].isRegistered, "Institution not found");
        registeredInstitutions[_name].isRegistered = false;
    }

    function addCredits(string memory _name, uint256 _amount) public onlyOwner {
        require(registeredInstitutions[_name].isRegistered, "Institution not found");
        registeredInstitutions[_name].credits += _amount;
    }

    function verifyInstitutionLogin(string memory _name, bytes32 _passwordHash) public view returns (bool) {
        Institution memory inst = registeredInstitutions[_name];
        return inst.isRegistered && inst.passwordHash == _passwordHash;
    }

    function issueCertificate(string memory _credentialId, bytes32 _hash, string memory _institution) public onlyAuthorized {
        require(!certificates[_hash].exists, "Certificate already registered");
        require(registeredInstitutions[_institution].credits >= 1, "Insufficient credits. Please recharge.");
        
        registeredInstitutions[_institution].credits -= 1;
        
        certificates[_hash] = Certificate({
            contentHash: _hash,
            institution: _institution,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true,
            isRevoked: false
        });

        credentialToHash[_credentialId] = _hash;

        emit CertificateIssued(_hash, _credentialId, _institution, block.timestamp);
    }

    function revokeCertificate(bytes32 _hash) public onlyAuthorized {
        require(certificates[_hash].exists, "Certificate not found");
        require(!certificates[_hash].isRevoked, "Already revoked");
        
        certificates[_hash].isRevoked = true;
        emit CertificateRevoked(_hash, block.timestamp);
    }

    function verifyCertificate(bytes32 _hash) public view returns (
        bool exists, 
        bool isRevoked,
        string memory institution, 
        uint256 timestamp, 
        uint256 blockNumber
    ) {
        Certificate memory cert = certificates[_hash];
        return (cert.exists, cert.isRevoked, cert.institution, cert.timestamp, cert.blockNumber);
    }

    function getHashByCredential(string memory _credentialId) public view returns (bytes32) {
        return credentialToHash[_credentialId];
    }
}
