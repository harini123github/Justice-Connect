create table users (
    id int primary key,
    username varchar(50) not null unique,
    password varchar(255) not null,
    email varchar(100) not null unique,
    created_at timestamp default current_timestamp,
    address text,
    phone varchar(20),
    privatekey text
);
create table judgements (
    id int primary key,
    user_id int not null,
    judgementtitle text not null,
    created_at timestamp default current_timestamp,
    pdfdetails text,
    ipfskey text,
    blockchainkey text,
    foreign key (user_id) references users(id)
);
