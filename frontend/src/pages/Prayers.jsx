import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'

const PRAYERS = {
  "Daily Prayers": [
    {
      name: "Sign of the Cross",
      text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen."
    },
    {
      name: "Glory Be",
      text: "Glory be to the Father and to the Son and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen."
    },
    {
      name: "Our Father",
      text: "Our Father, who art in Heaven, hallowed be Thy name. Thy kingdom come, Thy will be done on earth as it is in Heaven. Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen."
    },
    {
      name: "Hail Mary",
      text: "Hail Mary, full of grace, the Lord is with Thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."
    },
    {
      name: "Morning Offering",
      text: "My God, I thank you for protecting me through the night. I praise you and give you thanks for all the blessings you have bestowed on me. In union with Jesus, I consecrate to you all my thoughts, words, actions, joys, and sufferings of this day. Mary, my mother, bless me this day and protect me from dangers. My Guardian Angel and all my patrons, pray for me. Amen."
    },
    {
      name: "Night Prayer",
      text: "Lord Jesus Christ, you have given your followers an example of gentleness and humility, a task that is easy, a burden that is light. Accept the prayers and work of this day, and give us the rest that will strengthen us to render more faithful service to you who live and reign forever and ever. Amen."
    },
    {
      name: "Guardian Angel Prayer",
      text: "Angel of God, my guardian dear, to whom God's love commits me here. Ever this day be at my side, to light and guard, to rule and guide. Amen."
    },
    {
      name: "Grace Before Meals",
      text: "Bless us, O Lord, in these your gifts, which we are about to receive from your bounty through Christ our Lord. Amen."
    },
    {
      name: "Grace After Meals",
      text: "We give you thanks, O Almighty God, for these your benefits, who lives and reigns, world without end. Amen."
    },
  ],
  "Creeds": [
    {
      name: "Apostles' Creed",
      text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell. On the third day he rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father almighty. From there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      image: "/prayer-cards/apostles-creed.jpg"
    },
    {
      name: "Nicene Creed",
      text: "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.",
      image: "/prayer-cards/nicene-creed.jpg"
    },
  ],
  "Marian Prayers": [
    {
      name: "Hail Holy Queen",
      text: "Hail, holy Queen, mother of mercy, our life, our sweetness, and our hope. To thee we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
      image: "/prayer-cards/hail-holy-queen.jpg"
    },
    {
      name: "Memorare",
      text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly to thee, O Virgin of virgins, my mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
      image: "/prayer-cards/memorare.jpg"
    },
    {
      name: "Magnificat",
      text: "My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for he has looked with favor on his lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is his Name. He has mercy on those who fear him in every generation. He has shown the strength of his arm, he has scattered the proud in their conceit. He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich he has sent away empty. He has come to the help of his servant Israel, for he has remembered his promise of mercy, the promise he made to our fathers, to Abraham and his children forever.",
      image: "/prayer-cards/magnificat.jpg"
    },
  ],
  "Acts": [
    {
      name: "Act of Contrition",
      text: "O My God, I am heartily sorry for having offended you, and I detest all my sins, because of your just punishments, but most of all, because they offend you, my God, who are all good and deserving of all my love. I firmly resolve, with the help of your grace, to sin no more, and to avoid the near occasions of sin. Amen.",
      image: "/prayer-cards/act-of-contrition.jpg"
    },
    {
      name: "Act of Faith",
      text: "O my God, I firmly believe that you are one God in three divine Persons, Father, Son and Holy Spirit. I believe that your divine Son became flesh, died for our sins, and that he will come to judge the living and the dead. I believe these and all the truths that the Holy Catholic Church teaches because you have revealed them, who can neither deceive nor be deceived. Amen.",
      image: "/prayer-cards/act-of-faith.jpg"
    },
    {
      name: "Act of Hope",
      text: "O my God, relying on your almighty power, infinite mercy and promises, I hope to obtain pardon for my sins, the help of your grace, and life everlasting through the merits of Jesus Christ, my Lord and Redeemer. Amen.",
      image: "/prayer-cards/act-of-hope.jpg"
    },
    {
      name: "Act of Love",
      text: "O my God, I love you above all things, with my whole heart and soul, because you are all good and worthy of all love. I love my neighbor as myself for the love of you. I forgive all who have injured me and ask pardon of all whom I have injured. Amen.",
      image: "/prayer-cards/act-of-love.jpg"
    },
  ],
  "To the Holy Spirit": [
    {
      name: "Prayer to the Holy Spirit",
      text: "Breathe into me, Spirit of God, that I may think what is holy. Drive me, Spirit of God, that I may do what is holy. Draw me, Spirit of God, that I may love what is holy. Strengthen me, Spirit of God, that I may preserve what is holy. Guide me, Spirit of God, that I may never lose what is holy. Amen.",
      image: "/prayer-cards/holy-spirit.jpg"
    },
    {
      name: "Come, Holy Spirit",
      text: "Come, Holy Spirit, fill the hearts of your faithful and enkindle in them the fire of your love. Send forth your Spirit and they shall be created, and you shall renew the face of the earth. O God, who has instructed the hearts of your faithful by the light of the Holy Spirit, grant that by the same Holy Spirit we may have a right judgment in all things and evermore rejoice in his consolations. Through Christ Our Lord. Amen.",
      image: "/prayer-cards/come-holy-spirit.jpg"
    },
    {
      name: "Fatima Prayer",
      text: "O my Jesus, forgive us our sins, save us from the fire of hell, lead all souls to heaven, especially those who are in most need of Thy mercy.",
      image: "/prayer-cards/fatima.jpg"
    },
  ],
  "Intercessory": [
    {
      name: "Prayer to St. Michael",
      text: "Saint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, thrust into Hell Satan and all the evil spirits who prowl about the world for the ruin of souls. Amen.",
      image: "/prayer-cards/st-michael.jpg"
    },
    {
      name: "Prayer of St. Francis",
      text: "Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; and where there is sadness, joy. O Divine Master, grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love; for it is in giving that we receive; it is in pardoning that we are pardoned; and it is in dying that we are born to eternal life. Amen.",
      image: "/prayer-cards/st-francis.jpg"
    },
    {
      name: "Prayer to St. Jude",
      text: "Most holy apostle, Saint Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of hopeless cases, of things almost despaired of. Pray for me, I am so helpless and alone. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need, that I may receive the consolation and help of heaven in all my necessities, tribulations, and sufferings, particularly (here make your request), and that I may praise God with you and all the elect forever. Amen.",
      image: "/prayer-cards/st-jude.jpg"
    },
    {
      name: "Anima Christi",
      text: "Soul of Christ, sanctify me. Body of Christ, save me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. Good Jesus, hear me. Within your wounds, shelter me. From turning away, keep me. From the evil one, protect me. At the hour of my death, call me. Into your presence lead me, to praise you with all your saints, forever and ever. Amen.",
      image: "/prayer-cards/anima-christi.jpg"
    },
    {
      name: "Suscipe",
      text: "Take, Lord, and receive all my liberty, my memory, my understanding, and my entire will, all that I have and possess. You have given all to me; to you, Lord, I return it. All is yours; dispose of it wholly according to your will. Give me your love and your grace, for this is sufficient for me.",
      image: "/prayer-cards/st-ignatius.jpg"
    },
    {
      name: "Prayer Before a Crucifix",
      text: "Behold, O kind and most sweet Jesus, I cast myself upon my knees in your sight, and with the most fervent desire of my soul I pray and beseech you to impress upon my heart lively sentiments of faith, hope, and charity, true repentance for my sins, and a firm purpose of amendment, while with deep affection and grief of soul I ponder within myself and mentally contemplate your five most precious wounds, having before my eyes that which David spoke in prophecy of you, O good Jesus: 'They have pierced my hands and feet, they have numbered all my bones.' Amen.",
      image: "/prayer-cards/christ-crucified.jpg"
    },
  ],
  "For Others": [
    {
      name: "Prayer for the Sick",
      text: "O God, your Son accepted our sufferings to teach us the virtue of patience in human illness. Hear the prayers we offer for our sick brothers and sisters. May all who suffer pain, illness, or disease realize that they are chosen to be saints, and know that they are joined to Christ in his suffering for the salvation of the world, who lives and reigns with you and the Holy Spirit, one God, forever and ever. Amen.",
      image: "/prayer-cards/healing.jpg"
    },
    {
      name: "Prayer for the Faithful Departed",
      text: "God, Creator and Redeemer of all the faithful, grant to the souls of your servants and handmaids the forgiveness of all their sins. Through our devout prayers may they obtain the pardon which they have always desired. We ask this through Christ our Lord. Amen.",
      image: "/prayer-cards/faithful-departed.jpg"
    },
    {
      name: "Eternal Rest",
      text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.",
      image: "/prayer-cards/eternal-rest.jpg"
    },
  ],
  "Litany": [
    {
      name: "Litany of the Saints",
      text: "Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us. God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us. Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of Virgins, pray for us. Saint Michael, pray for us. Saint Gabriel, pray for us. Saint Raphael, pray for us. All you holy Angels and Archangels, pray for us. Saint John the Baptist, pray for us. Saint Joseph, pray for us. All you holy Patriarchs and Prophets, pray for us. Saint Peter, pray for us. Saint Paul, pray for us. Saint Andrew, pray for us. Saint John, pray for us. All you holy Apostles and Evangelists, pray for us. All you holy Disciples of the Lord, pray for us. All you holy Innocents, pray for us. Saint Stephen, pray for us. All you holy Martyrs, pray for us. Saint Gregory, pray for us. Saint Augustine, pray for us. All you holy Bishops and Confessors, pray for us. Saint Benedict, pray for us. Saint Francis, pray for us. All you holy Priests and Levites, pray for us. Saint Mary Magdalene, pray for us. Saint Agnes, pray for us. Saint Cecilia, pray for us. Saint Clare, pray for us. All you holy Virgins and Widows, pray for us. All you holy Saints of God, pray for us. Christ, hear us. Christ, graciously hear us. Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us.",
      image: "/prayer-cards/litany-saints.jpg"
    },
  ],
}

function Prayers() {
  const [category, setCategory] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [category, selected])

  function selectCategory(cat) {
    setCategory(cat)
  }

  function selectPrayer(prayer) {
    setSelected(prayer)
  }

  function backFromPrayer() {
    setSelected(null)
  }

  function backFromCategory() {
    setCategory(null)
  }

  if (selected) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromPrayer} />
          <p className="readings-eyebrow">{category}</p>
          <h1 className="struggle-category-title">{selected.name}</h1>
        </div>
        <div className="page-content">
          {selected.image && (
            <div className="prayer-image-block">
              <img
                src={selected.image}
                alt={selected.name}
                className="prayer-image"
              />
            </div>
          )}
          <div className="prayer-detail-card">
            <p className="prayer-detail-text">{selected.text}</p>
          </div>
        </div>
      </div>
    )
  }

  if (category) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromCategory} />
          <p className="readings-eyebrow">Prayers</p>
          <h1 className="struggle-category-title">{category}</h1>
        </div>
        <div className="page-content">
          <div className="prayers-items">
            {PRAYERS[category].map(prayer => (
              <button
                key={prayer.name}
                className="prayer-item-btn"
                onClick={() => selectPrayer(prayer)}
              >
                {prayer.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Traditional Prayers</p>
        <h1 className="struggle-category-title">Prayers</h1>
      </div>
      <div className="page-content">
        <div className="prayers-category-grid">
          {Object.keys(PRAYERS).map(cat => (
            <button
              key={cat}
              className="prayers-category-btn"
              onClick={() => selectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prayers